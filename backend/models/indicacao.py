from database import db
from datetime import date

class IndicacaoSemana(db.Model):
    __tablename__ = "indicacoes_semana"
    id = db.Column(db.Integer, primary_key=True)
    livro_id = db.Column(db.Integer, db.ForeignKey("livros.id"), nullable=False)
    data_inicio = db.Column(db.Date, nullable=False)
    data_fim = db.Column(db.Date, nullable=False)

    livro = db.relationship("Livro", backref="indicacoes_semana")
