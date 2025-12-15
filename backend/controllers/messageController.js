import dotenv from 'dotenv';
dotenv.config(); 

import pool from '../databases/postgres.js';
import { pipeline } from '@huggingface/transformers';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const SIMILARITY_THRESHOLD = 0.75;
const TOP_K_CHUNKS = 3;

/**
 * Simple text chunking function using Sentence-Based Chunking approach
 * 
 * @param {*} text - The text to be chunked
 * @param {*} chunkSize 
 * @returns chunks array
 */
function chunkText(text, chunkSize=250) {
    if (overlapSize >= chunkSize) {
        console.error("overlapSize must be less than chunkSize");
        overlapSize = 0;
    }

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ( (currentChunk + sentence).length > chunkSize && currentChunk) {
            chunks.push(currentChunk.trim());

            // Start the new chunk using the end of the previous chunk (overlap)
            const overlap = currentChunk.substring(currentChunk.length - overlapSize);
            currentChunk = overlap + sentence;
        } else {
            currentChunk += sentence;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
}

async function generateEmbedding(text) {
    try {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const output = await extractor(text, {
            pooling: 'mean',
            normalize: true
        });

        return Array.from(output.data);
    } catch (error) {
        console.error("Error generating embeddings: ", error);
        throw error;
    }
}

/**
 * One-time Setup: Ingest FAQ documents, chunk them, and store embeddings
 * Call this endpoint once after populating faq_documents table
 * 
 * POST /api/ingestDocuments
 */
export const ingestDocuments = async (request, response) => {
    
    const getDocsResultSql = `
        SELECT id, title, source
        FROM faq_documents
    `;

    const insertChunksSql = `
        INSERT INTO faq_chunks (document_id, content ,embedding) 
        VALUES ($1, $2, $3)
    `; 

    try {
        const documentsResult = await pool.query(getDocsResultSql);

        if (documentsResult.rows.length === 0) {

            const responseJson = {
                success: false,
                message: "No documents found to ingest"
            };

            return response.status(404).send(JSON.stringify(responseJson));
        }

        let totalChunks = 0;

        for (const doc of documentsResult.rows) {
            const fullText = `${doc.title}\n\n${doc.source}`;
            const chunks = chunkText(fullText);

            for (const chunk of chunks) {
                const embedding = await generateEmbedding(chunk);

                await pool.query(insertChunksSql, [doc.id, chunk, JSON.stringify(embedding)]);

                totalChunks++;
            }
        }

        const responseJson = {
            success: true,
            message: `Successfully ingested ${documentsResult.rows.length} documents into ${totalChunks} chunks`
        }

        return response.status(201).send(JSON.stringify(responseJson));
    } catch (error) {
        console.error("Error ingesting documents: ", error);
        const responseJson = {
            success: false,
            message: "Error processing documents",
            error: error.message
        }
        return response.status(500).send(JSON.stringify(responseJson));
    }
}

/**
 * Endpoint to handle user chat messages with RAG
 * 
 * POST /api/sendMessage
 * Body: { message: "user question here" } 
 * 
 * @param {*} request - The request sent by the client-side
 * @param {*} response - The response to be adjusted by the function and sent
 * @returns a message response from the server, answering what the client asked for
 */
export const sendMessage = async (request, response) => {
    const { message } = request.body;

    if (!message || message.trim().length === 0) {
        const responseObj = {
            success: false,
            message: "Message cannot be empty"
        }

        return response.status(404).send(JSON.stringify(responseObj));
    }

    const similaritySearchSql = `
        SELECT c.content, d.title, d.category, 1 - (c.embedding <=> $1) as similarity
        FROM faq_chunks c
        JOIN faq_documents d ON c.document_id = d.id
        ORDER BY c.embedding <=> $1
        LIMIT $2
    `;

    try {
        const queryEmbedding = await generateEmbedding(message);

        const searchResult = await pool.query(similaritySearchSql, [JSON.stringify(queryEmbedding), TOP_K_CHUNKS]);

        const relevantChunks = searchResult.rows.filter(
            row => row.similarity >= SIMILARITY_THRESHOLD
        );

        if (relevantChunks.length === 0) {

            const responseMessage = `
                I apologize, but I don't have enough information to answer that question confidently. 
                This seems like something our medical staff should address directly. 
                Please contact our office at (555) 123-4567 or schedule an appointment for personalized assistance.
            `;

            const responseObj = {
                success: true,
                message: responseMessage,
                confidence: "low",
                sources: []
            }

            return response.status(200).send(JSON.stringify(responseObj));
        }

        const context = relevantChunks 
            .map(chunk => `${chunk.title}:\n${chunk.content}`)
            .join('\n\n---\n\n');

        const systemPrompt = `
            You are a helpful medical clinic assistant. 
            Answer questions based ONLY on the provided context.

            Rules:
            - Be concise and friendly
            - If the context doesn't contain the answer, say "I don't have that information"
            - Never provide medical diagnosis or clinical advice
            - Always suggest contacting a doctor for medical concerns
            - Use the context informatino to answer administrative questions about appointments, billing, hours, etc.
        `;

        const userPrompt = `
            Context:\n${context}\n\nPatient Question: ${message}\n\nProvide a hepful answer based on the context ahove.
        `;

        const responseAI = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\n${userPrompt}`
        });

        const assistantResponse = responseAI.text;

        // Returning responses with sources
        const responseObj = {
            success: true,
            message: assistantResponse,
            confidence: "high",
            sources: relevantChunks.map(chunk => ({
                title: chunk.title,
                category: chunk.category,
                similarity: chunk.similarity.toFixed(3)
            }))
        }

        return response.status(200).send(JSON.stringify(responseObj));

    } catch (error) {
        console.error("Error processing message: ", error);
        const responseObj = {
            success: false,
            message: "I'm having trouble processing your request right now. Please try again or contact our office directly at (555) 123-4567.",
            error: error.message
        };

        return response.status(500).send(JSON.stringify(responseObj));
    }
}