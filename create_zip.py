import os
import shutil
import zipfile

def create_zip():
    output_filename = 'public/app-source.zip'
    os.makedirs('public', exist_ok=True)
    
    ignore_dirs = {'node_modules', '.git', 'dist', '.cache', '.upm'}
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if file.endswith('.zip') or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)

    shutil.copyfile(output_filename, 'project_code.zip')
    shutil.copyfile(output_filename, 'public/project_code.zip')
    print(f"Zip created successfully: {output_filename}, size: {os.path.getsize(output_filename)} bytes")

if __name__ == '__main__':
    create_zip()
