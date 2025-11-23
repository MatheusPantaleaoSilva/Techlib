from database import db
from datetime import date

class Livro(db.Model):
    __tablename__ = "livros"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)
    data_aquisicao = db.Column(db.Date, nullable=False)
    imagem_url = db.Column(db.String(500), nullable=True)
    quantidade = db.Column(db.Integer, nullable=False, default=1)

    def mostrar_dados(self):
        from models.emprestimo import Emprestimo

        qtd_emprestados = Emprestimo.query.filter_by(livro_id=self.id, data_devolucao=None).count()
        
        disponiveis = self.quantidade - qtd_emprestados

        return {
            "id": self.id,
            "nome": self.nome,
            "autor": self.autor,
            "isbn": self.isbn,
            "categoria_id": self.categoria_id,
            "categoria_nome": self.categoria_obj.nome if self.categoria_obj else "Sem Categoria",
            "data_aquisicao": self.data_aquisicao.isoformat() if self.data_aquisicao else None,
            "imagem_url": self.imagem_url,
            "quantidade": self.quantidade,           # Total no acervo
            "quantidade_disponivel": disponiveis     # O que está na estante agora
        }