import os
import csv
from pathlib import Path

def register_user_entry(custom_serial, firstname, lastname, description, inbox_fee, amount_class, beacon):
    """
    Appends a new user record to users.csv. 
    Creates the file with headers if it does not exist.
    """
    file_path = Path("/var/www/distributedmailsystem.com/users.csv")
    headers = ["CustomSerialNumber", "FirstName", "LastName", "Description", "InboxFee", "Class", "Beacon"]
    
    # Ensure the directory exists
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        return f"Error creating directory: {e}"

    file_exists = file_path.exists()

    try:
        # Open in append mode ('a'). newline='' is required for the csv module.
        with open(file_path, mode='a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            
            # Write header only if the file is being created for the first time
            if not file_exists:
                writer.writeheader()
            
            # Write the user data
            writer.writerow({
                "CustomSerialNumber": custom_serial,
                "FirstName": firstname,
                "LastName": lastname,
                "Description": description,
                "InboxFee": inbox_fee,
                "Class": amount_class,
                "Beacon": beacon
            })

        # Set file permissions to be readable/writable by all (666)
        # Note: This requires the script owner to have permission to change mode.
        os.chmod(file_path, 0o666)
        return "User registered successfully."

    except PermissionError:
        return "Error: Permission denied. Check access to /var/www/distributedmailsystem.com/"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

# Example Usage:
# register_user_entry("RT5", "Sean", "Worthington", "CEO", 100, "giga", "raida11")