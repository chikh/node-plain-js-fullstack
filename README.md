# Test task implementation

## Prerequisites

In order to run the app, you should have *PostgreSQL* up and running on the default port (which is 5432). The app uses database named "*eurochem-test*". Since PostgreSQL runs locally, it is supposed to add
```
. . .

local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD

#eurochem-test
host eurochem-test <your usename here> 127.0.0.1/32 trust

. . .
```
into your `pg_hba.conf` file. Replace `<your username here>` with real user's name.
