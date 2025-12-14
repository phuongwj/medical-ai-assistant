import pool from "../databases/postgres.js";

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

}

/**
 * One-time Setup: Ingest FAQ documents, chunk them, and store embeddings
 * Call this endpoint once after populating faq_documents table
 * 
 * POST /api/ingestDocuments
 */
export const ingestDocuments = async (request, response) => {

}