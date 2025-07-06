def calculate_power(base, exponent):
    """
    Calculate the power of base raised to exponent.
    
    Parameters:
    base (float): The base number
    exponent (float): The exponent to raise the base to
    
    Returns:
    float: Result of base raised to the power of exponent
    """
    return base ** exponent

def main():
    try:
        base = float(input("Enter the base number: "))
        exponent = float(input("Enter the exponent: "))
        
        result = calculate_power(base, exponent)
        print(f"{base} raised to the power of {exponent} is: {result}")
    except ValueError:
        print("Please enter valid numbers.")

if __name__ == "__main__":
    main()