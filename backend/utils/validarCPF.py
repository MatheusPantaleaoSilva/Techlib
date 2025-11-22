def validar_cpf(cpf: str) -> bool:
    # Remove caracteres não numéricos
    cpf = "".join(filter(str.isdigit, cpf))

    # Deve ter 11 dígitos
    if len(cpf) != 11:
        return False

    # Não pode ser sequência de números iguais
    if cpf == cpf[0] * 11:
        return False

    # Cálculo do primeiro dígito verificador
    soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
    dig1 = (soma * 10 % 11) % 10

    # Cálculo do segundo dígito verificador
    soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
    dig2 = (soma * 10 % 11) % 10

    return dig1 == int(cpf[9]) and dig2 == int(cpf[10])