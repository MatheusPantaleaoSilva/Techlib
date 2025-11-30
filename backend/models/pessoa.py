from database import db

tabela_favoritos = db.Table(
    "favoritos",
    db.Column("pessoa_id", db.Integer, db.ForeignKey("pessoas.id"), primary_key=True),
    db.Column("livro_id", db.Integer, db.ForeignKey("livros.id"), primary_key=True)
)

class Pessoa(db.Model):
    __tablename__ = "pessoas"

    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    numero = db.Column(db.String(20), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)

    usuario = db.relationship(
        "Usuario",
        back_populates="pessoa",
        cascade="all, delete-orphan",
        uselist=False
    )

    favoritos = db.relationship(
        "Livro",
        secondary=tabela_favoritos,
        backref=db.backref("favoritado_por", lazy="dynamic"),
        lazy="dynamic"
    )

    def mostrar_dados(self):
        return {
            "id": self.id,
            "cpf": self.cpf,
            "nome": self.nome,
            "idade": self.idade,
            "email": self.email,
            "numero": self.numero,
            "tipo": self.tipo,
        }