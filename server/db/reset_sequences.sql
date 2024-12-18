GRANT ALL PRIVILEGES ON DATABASE cookbook_app_test TO cookbook_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO cookbook_user;


DO $$
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN 
        SELECT c.relname AS sequence_name
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relkind = 'S' AND n.nspname = 'public'
    LOOP
        EXECUTE FORMAT('ALTER SEQUENCE %I OWNER TO cookbook_user', seq.sequence_name);
    END LOOP;
END $$;
