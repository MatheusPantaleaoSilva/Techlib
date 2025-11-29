from database import db
from datetime import date

livro_categoria = db.Table('livro_categoria',
    db.Column('livro_id', db.Integer, db.ForeignKey('livros.id'), primary_key=True),
    db.Column('categoria_id', db.Integer, db.ForeignKey('categorias.id'), primary_key=True)
)

class Livro(db.Model):
    __tablename__ = "livros"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    descricao = db.Column(db.String(500), nullable=True)
    data_aquisicao = db.Column(db.Date, nullable=False)
    imagem_url = db.Column(db.String(500), nullable=True)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    categorias = db.relationship('Categoria', secondary=livro_categoria, backref=db.backref('livros_rel', lazy='dynamic'))

    def mostrar_dados(self):
        from models.emprestimo import Emprestimo

        qtd_emprestados = Emprestimo.query.filter_by(livro_id=self.id, data_devolucao=None).count()
        disponiveis = self.quantidade - qtd_emprestados

        lista_categorias = [{"id": c.id, "nome": c.nome} for c in self.categorias]

        return {
            "id": self.id,
            "nome": self.nome,
            "autor": self.autor,
            "isbn": self.isbn,
            "categorias": lista_categorias,
            "descricao": self.descricao,
            "data_aquisicao": self.data_aquisicao.isoformat() if self.data_aquisicao else None,
            "imagem_url": self.imagem_url,
            "quantidade": self.quantidade,
            "quantidade_disponivel": disponiveis,
            "ativo": self.ativo
        }