from Nirikshan.logger import logging
from Nirikshan.exception import AppException
import sys

try:
    a= 3 //0

except Exception as e:
    logging.error(e)
    raise AppException(e, sys)

