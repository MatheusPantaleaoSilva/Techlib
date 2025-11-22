from .pessoa import Pessoa

class Funcionario(Pessoa):
    def __init__(self, cpf, nome, idade, email, numero, cargo: str):
        super().__init__(cpf, nome, idade, email, numero)
        self.cargo = cargo

    def mostrar_dados(self):
        dados = super().mostrar_dados()
        dados["cargo"] = self.cargo
        return dados
