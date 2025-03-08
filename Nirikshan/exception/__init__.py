import sys

def error_message_detail(error, error_detail: sys):
    """
    Extracts detailed error message including the file name, line number, and error message.
    
    :param error: Exception object
    :param error_detail: sys module to get the traceback details
    :return: Formatted error message string
    """
    _, _, exc_tb = error_detail.exc_info()  # Get the traceback object

    file_name = exc_tb.tb_frame.f_code.co_filename  # Get the file name where the error occurred

    error_message = "Error occurred in python script name [{0}] line number [{1}] error message [{2}]".format(
        file_name, exc_tb.tb_lineno, str(error)  # Format the error message with file name, line number, and error message
    )

    return error_message  # Return the formatted error message

class AppException(Exception):
    """
    Custom exception class for the application.
    """
    def __init__(self, error_message, error_detail):
        """
        Initializes the AppException instance with detailed error message.
        
        :param error_message: Error message in string format
        :param error_detail: sys module to get the traceback details
        """
        super().__init__(error_message)  # Initialize the base Exception class with the error message

        self.error_message = error_message_detail(
            error_message, error_detail=error_detail  # Get the detailed error message
        )

    def __str__(self):
        """
        Returns the detailed error message when the exception is converted to a string.
        
        :return: Detailed error message string
        """
        return self.error_message  # Return the detailed error message