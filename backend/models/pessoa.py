from database import db

class Pessoa(db.Model):
    __tablename__ = "pessoas"

    id = db.Column(db.Integer, primary_key=True)
    cpf = db.Column(db.String(11), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    numero = db.Column(db.String(15), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # cliente, professor, funcionario

    usuario = db.relationship("Usuario", back_populates="pessoa", uselist=False)
    usuario = db.relationship(
        "Usuario",
        back_populates="pessoa",
        cascade="all, delete-orphan",
        uselist=False  # 1:1
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
