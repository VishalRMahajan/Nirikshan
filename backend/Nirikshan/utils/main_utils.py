import os.path
import sys
import yaml
import base64

from Nirikshan.exception import AppException
from Nirikshan.logger import logging

def read_yaml_file(file_path: str) -> dict:
    """
    Reads a YAML file and returns its content as a dictionary.
    
    :param file_path: Path to the YAML file
    :return: Dictionary containing YAML file content
    """
    try:
        with open(file_path, "rb") as yaml_file:
            logging.info("YAML file read successfully")
            return yaml.safe_load(yaml_file)
    except Exception as e:
        raise AppException(e, sys) from e

def write_yaml_file(file_path: str, content: object, replace: bool = False) -> None:
    """
    Writes content to a YAML file.
    
    :param file_path: Path to the YAML file
    :param content: Content to write to the YAML file
    :param replace: Whether to replace the file if it exists
    """
    try:
        if replace:
            if os.path.exists(file_path):
                os.remove(file_path)  # Remove the existing file if replace is True

        os.makedirs(os.path.dirname(file_path), exist_ok=True)  # Create directories if they don't exist

        with open(file_path, "w") as file:
            yaml.dump(content, file)
            logging.info("YAML file written successfully")
    except Exception as e:
        raise AppException(e, sys)

def decodeImage(imgstring, fileName):
    """
    Decodes a base64 encoded image string and saves it to a file.
    
    :param imgstring: Base64 encoded image string
    :param fileName: Name of the file to save the decoded image
    """
    imgdata = base64.b64decode(imgstring)
    with open("./data/" + fileName, 'wb') as f:
        f.write(imgdata)
        f.close()

def encodeImageIntoBase64(croppedImagePath):
    """
    Encodes an image file into a base64 string.
    
    :param croppedImagePath: Path to the image file
    :return: Base64 encoded string of the image
    """
    with open(croppedImagePath, "rb") as f:
        return base64.b64encode(f.read())