import csv

def convert_report_to_csv(text_file_path, csv_file_path):
    report_data = []
    with open(text_file_path, 'r') as file:
        # Skip the first line (headers)
        next(file)

        # Read the report data
        for line in file:
            # Split the line by tabs
            file_name, line_number, message = line.strip().split('\t')
            report_data.append({
                'File': file_name,
                'Line': line_number,
                'Message': message
            })

    # Write the report data to CSV
    with open(csv_file_path, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['File', 'Line', 'Message'])
        writer.writeheader()
        writer.writerows(report_data)


# Specify the file paths
text_file_path = 'eslint_report.txt'
csv_file_path = 'eslint_report.csv'

# Convert the report to CSV
convert_report_to_csv(text_file_path, csv_file_path)
