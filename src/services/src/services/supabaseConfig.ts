import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxdlufepoetxmugsywan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZGx1ZmVwb2V0eG11Z3N5d2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzI2ODcsImV4cCI6MjA5NTkwODY4N30.sR2lwbs-xYwo4DG7jz1vjvHJREmNp8XZImwpiBSAXVI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
