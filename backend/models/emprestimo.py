from database import db
from models.pessoa import Pessoa
from models.livro import Livro
from datetime import date

class Emprestimo(db.Model):
    __tablename__ = "emprestimos"

    id = db.Column(db.Integer, primary_key=True)
    pessoa_id = db.Column(db.Integer, db.ForeignKey("pessoas.id"), nullable=False)
    livro_id = db.Column(db.Integer, db.ForeignKey("livros.id"), nullable=False)
    
    # MUDANÇA AQUI: De String para Date
    data_emprestimo = db.Column(db.Date, nullable=False)
    data_devolucao = db.Column(db.Date, nullable=True)

    pessoa = db.relationship("Pessoa", backref="emprestimos")
    livro = db.relationship("Livro", backref="emprestimos")

    def mostrar_dados(self):
        status = "ativo" if not self.data_devolucao else "devolvido"
        
        # Conversão segura para string
        data_emp_str = self.data_emprestimo.isoformat() if self.data_emprestimo else None
        data_dev_str = self.data_devolucao.isoformat() if self.data_devolucao else None
        
        # Carregar relacionamentos (opcional, dependendo da query, mas seguro manter assim)
        pessoa_obj = Pessoa.query.get(self.pessoa_id)
        livro_obj = Livro.query.get(self.livro_id)

        return {
            "id": self.id,
            "pessoa_id": self.pessoa_id,
            "pessoa_nome": pessoa_obj.nome if pessoa_obj else "Desconhecido",
            "livro_id": self.livro_id,
            "livro_nome": livro_obj.nome if livro_obj else "Desconhecido",
            "data_emprestimo": data_emp_str,
            "data_devolucao": data_dev_str,
            "status": status
        }