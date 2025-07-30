#!/usr/bin/expect -f

# Set timeout
set timeout 60

# Start the drizzle-kit generate command
spawn pnpm drizzle-kit generate

# Wait for the prompt about followed_id
expect "Is followed_id column in user_follows table created or renamed from another column?"

# Send down arrow to select rename option
send "\033\[B"
send "\r"

# Wait for any other prompts and handle them
expect {
    eof { exit 0 }
    timeout { exit 1 }
}