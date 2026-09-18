import imaplib
import email
import re
import sqlite3
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

db_path = os.path.join(os.path.dirname(__file__), 'leads.db')
env_path = os.path.join(os.path.dirname(__file__), '.env')

user = "ehbequitysolar@gmail.com"
password = "bbntwcvtxjirvqmr"

# Read .env if available
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith('GMAIL_USER='):
                user = line.split('=', 1)[1].strip()
            elif line.startswith('GMAIL_APP_PASS='):
                password = line.split('=', 1)[1].strip()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

bounced_emails = set()

try:
    mail = imaplib.IMAP4_SSL("imap.gmail.com")
    mail.login(user, password)
    mail.select("INBOX")

    status, messages = mail.search(None, '(FROM "mailer-daemon")')
    if status == 'OK':
        msg_ids = messages[0].split()
        for mid in msg_ids:
            res, data = mail.fetch(mid, "(RFC822)")
            for response_part in data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    payload_str = str(msg)
                    
                    m1 = re.findall(r"wasn't delivered to\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", payload_str, re.I)
                    m2 = re.findall(r"Final-Recipient:\s*rfc822;\s*([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)", payload_str, re.I)
                    m3 = re.findall(r"to\s+([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\s+because the address couldn't be found", payload_str, re.I)
                    
                    for found in m1 + m2 + m3:
                        clean = found.strip().lower()
                        if clean != user.lower() and not clean.endswith('googlemail.com') and not clean.endswith('google.com'):
                            bounced_emails.add(clean)

    mail.close()
    mail.logout()
except Exception as e:
    print(f"IMAP Error: {e}")

updated_count = 0
for b in sorted(bounced_emails):
    cursor.execute("UPDATE leads SET email_status = 'bounced', notes = COALESCE(notes || ' | ', '') || '⚠️ Correo rebotado (no existe)' WHERE LOWER(TRIM(email)) = LOWER(?)", (b,))
    if cursor.rowcount > 0:
        updated_count += cursor.rowcount

conn.commit()
conn.close()

print(f"Bounces processed. Total unique: {len(bounced_emails)}, DB leads updated: {updated_count}")
