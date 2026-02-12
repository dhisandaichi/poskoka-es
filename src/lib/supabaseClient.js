import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

/**
 * Supabase Client Initialization
 * 
 * If credentials are not provided (e.g. initial setup), createClient will throw an error or warning in most cases,
 * so we export it conditionally or export a "dummy" if missing for now to prevent app crash.
 * 
 * In production/dev, ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Service Layer Abstractions
 * These functions wrap Supabase queries for easier integration in components.
 * Currently they point to the Supabase client, but you can swap them out or mock them for testing.
 */

// --- Volunteers & Users ---
export const getVolunteers = async () => {
    const { data, error } = await supabase.from('volunteers').select('*');
    if (error) throw error;
    return data;
};

export const getVolunteerById = async (id) => {
    const { data, error } = await supabase.from('volunteers').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

// --- Attendance ---
export const getAttendance = async () => {
    const { data, error } = await supabase.from('attendance').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createAttendance = async (attendanceRecord) => {
    const { data, error } = await supabase.from('attendance').insert([attendanceRecord]).select();
    if (error) throw error;
    return data?.[0];
};

export const updateAttendance = async (id, updates) => {
    const { data, error } = await supabase.from('attendance').update(updates).eq('id', id).select();
    if (error) throw error;
    return data?.[0];
};

// --- Schedules ---
export const getSchedules = async () => {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    return data;
};

// --- Registrations ---
export const getRegistrationRequests = async () => {
    const { data, error } = await supabase.from('registrations').select('*').eq('status', 'pending');
    if (error) throw error;
    return data;
};

export const updateRegistrationStatus = async (id, status) => {
    const { data, error } = await supabase.from('registrations').update({ status }).eq('id', id).select();
    if (error) throw error;
    return data?.[0];
};

export const createRegistration = async (registrationData) => {
    const { data, error } = await supabase.from('registrations').insert([registrationData]).select();
    if (error) throw error;
    return data?.[0];
};

// --- Volunteers (Mutation) ---
export const createVolunteer = async (volunteerData) => {
    const { data, error } = await supabase.from('volunteers').insert([volunteerData]).select();
    if (error) throw error;
    return data?.[0];
};

// --- Reports ---
export const getReports = async () => {
    const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createReport = async (reportData) => {
    const { data, error } = await supabase.from('reports').insert([reportData]).select();
    if (error) throw error;
    return data?.[0];
};

// --- BKO Requests ---
export const getBKORequests = async () => {
    const { data, error } = await supabase.from('bko_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createBKORequest = async (bkoData) => {
    const { data, error } = await supabase.from('bko_requests').insert([bkoData]).select();
    if (error) throw error;
    return data?.[0];
};
