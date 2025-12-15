-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create faq_documents table
CREATE TABLE faq_documents (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	source TEXT NOT NULL,
	category TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faq_chunks table with vector embeddings
CREATE TABLE faq_chunks (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	document_id UUID REFERENCES faq_documents(id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	embedding vector(3072)
);

-- Insert mock FAQ documents
INSERT INTO faq_documents (title, source, category) VALUES
-- Appointments
('How to Book an Appointment', 
 'To book an appointment, you can: (1) Call our front desk at (555) 123-4567 during business hours, (2) Use our online patient portal at patient.example.com and click "Schedule Appointment", or (3) Use our mobile app. New patients should call first to register. Appointments typically available within 3-5 business days for non-urgent matters.',
 'Appointments'),

('Canceling or Rescheduling Appointments',
 'To cancel or reschedule: Call us at least 24 hours in advance at (555) 123-4567, or use the patient portal. Late cancellations (less than 24 hours) may incur a $25 fee. Emergency cancellations are exempt from fees.',
 'Appointments'),

('Walk-in vs Scheduled Appointments',
 'We accept walk-ins Monday through Friday 8 AM to 11 AM for urgent matters only. Scheduled appointments are preferred and guarantee shorter wait times. Walk-in patients are seen based on severity and availability.',
 'Appointments'),

('Booking Appointments for Family Members',
 'You can book appointments for minor children (under 18) using your account. Adult family members must create their own patient portal account or call directly.',
 'Appointments'),

-- Clinic Hours
('Regular Clinic Hours',
 'Our clinic is open Monday through Friday 8:00 AM to 5:00 PM. Saturday hours are 9:00 AM to 1:00 PM. We are closed on Sundays. Last appointments are scheduled 30 minutes before closing.',
 'Hours'),

('Holiday Hours and Closures',
 'We are closed on major federal holidays: New Year''s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving, and Christmas. Check our website or call for specific holiday hours changes.',
 'Hours'),

('Emergency After-Hours Contact',
 'For medical emergencies after hours, call 911 or go to the nearest emergency room. For urgent but non-emergency questions, call our after-hours nurse line at (555) 123-4568.',
 'Hours'),

-- Prescriptions
('Prescription Refill Process',
 'Request prescription refills through the patient portal, mobile app, or by calling your pharmacy directly. Allow 48-72 business hours for processing. Controlled substances require a doctor visit and cannot be refilled online.',
 'Prescriptions'),

('How Long Prescription Refills Take',
 'Standard prescription refills take 2-3 business days. Expedited requests may be available for urgent needs - call our office at (555) 123-4567 to request.',
 'Prescriptions'),

('Transferring Prescriptions to Another Pharmacy',
 'To transfer prescriptions: Contact your new pharmacy and provide them with our clinic information. They will coordinate with us. Allow 3-5 business days for transfer completion.',
 'Prescriptions'),

('What to Do for Lost Prescriptions',
 'If you lose a prescription: Contact our office immediately. Non-controlled medications can usually be reissued. Controlled substances require an in-person appointment. There may be a $15 administrative fee.',
 'Prescriptions'),

-- Lab Results
('How to Access Lab Results',
 'Lab results are available in your patient portal 3-7 days after testing. You will receive an email notification when results are ready. Log in to patient.example.com to view them.',
 'Lab Results'),

('Lab Result Turnaround Time',
 'Standard lab results: 3-5 business days. Complex tests: 7-14 days. Urgent results: 24-48 hours. Your doctor will contact you directly if immediate action is needed.',
 'Lab Results'),

('Understanding Your Lab Results',
 'Each lab result includes a normal reference range. Values outside this range will be flagged. If you have questions about your results, message your doctor through the portal or call to schedule a follow-up appointment.',
 'Lab Results'),

('What If My Results Are Abnormal',
 'If your results are abnormal, your doctor will contact you within 3-5 business days to discuss next steps. Urgent abnormal results will be communicated within 24 hours. Do not panic - many abnormal results require simple follow-up testing.',
 'Lab Results'),

-- Insurance and Billing
('Accepted Insurance Plans',
 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, and Medicare. Call our billing department at (555) 123-4569 to verify your specific plan.',
 'Insurance'),

('How to Submit Insurance Claims',
 'We submit claims directly to your insurance company. Bring your insurance card to each visit. You are responsible for co-pays at time of service. If we are out-of-network, you may need to submit claims yourself.',
 'Insurance'),

('Payment Options and Plans',
 'We accept cash, credit/debit cards, checks, and offer payment plans for balances over $500. Contact our billing department at (555) 123-4569 to set up a payment plan.',
 'Insurance'),

('Understanding Your Medical Bill',
 'Your bill includes: (1) Provider charges for the visit, (2) Any lab or diagnostic tests, (3) After insurance adjustments. The statement shows what insurance paid and your remaining balance. Call billing at (555) 123-4569 with questions.',
 'Insurance'),

('Co-pay and Deductible Questions',
 'Co-pays are due at check-in. Deductibles are what you pay before insurance coverage begins. Your insurance card shows your co-pay amounts. Call your insurance company or our billing department for deductible information.',
 'Insurance'),

-- General Administrative
('Requesting Medical Records',
 'Request medical records by completing a release form (available at front desk or online). Processing takes 7-10 business days. There may be a copying fee. Records can be sent to you or another provider.',
 'Administration'),

('Updating Contact Information',
 'Update your contact information through the patient portal under Profile Settings, or call our front desk at (555) 123-4567. Please keep your phone number and email current for appointment reminders.',
 'Administration'),

('Privacy and HIPAA Rights',
 'We comply with HIPAA privacy rules. Your health information is confidential and shared only with your consent or as required by law. You have the right to access your records and request amendments. See our full privacy policy at reception.',
 'Administration'),

('Patient Portal Registration',
 'Register for the patient portal at patient.example.com. Click "New User Registration" and enter the activation code from your visit summary. If you did not receive a code, call (555) 123-4567.',
 'Administration'),

('Parking and Directions',
 'We are located at 123 Medical Plaza, Suite 200. Free parking is available in the garage (entrance on Oak Street). Visitor parking is on Level 2. Handicap accessible spaces near the main entrance.',
 'Administration');