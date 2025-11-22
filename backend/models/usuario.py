from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    pessoa_id = db.Column(db.Integer, db.ForeignKey("pessoas.id"), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False, default="CLIENTE")  # CLIENTE ou FUNCIONARIO

    # Relacionamento com Pessoa (import indireto para evitar erro de import circular)
    pessoa = db.relationship("Pessoa", back_populates="usuario")

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def checar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
