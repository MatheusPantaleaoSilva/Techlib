from flask_cors import CORS
from flask import Flask
from database import init_db, db
from routes.pessoas import pessoas_bp
from routes.livros import livros_bp
from routes.emprestimos import emprestimos_bp
from routes.auth import auth_bp
from routes.indicacoes import indicacoes_bp
from routes.categorias import categorias_bp
from flask_jwt_extended import JWTManager
import os 

# Importar os modelos necessários para criar o admin
from models.usuario import Usuario
from models.pessoa import Pessoa

app = Flask(__name__)
init_db(app)
CORS(app)

# LER A CHAVE DO .ENV
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "chave_padrao_insegura_dev")

jwt = JWTManager(app)

# Cria a tabela e o admin padrão
with app.app_context():
    try:
        db.create_all()
        print("Tabelas verificadas/criadas com sucesso")

        admin_existente = Usuario.query.filter_by(role="FUNCIONARIO").first()

        if not admin_existente:
            print("Nenhum administrador encontrado. Criando conta padrão...")

            admin_pessoa = Pessoa(
                nome="Administrador do Sistema",
                cpf="00000000000", 
                idade=99,
                email="admin@biblioteca.com",
                numero="000000000",
                tipo="FUNCIONARIO"
            )
            
            db.session.add(admin_pessoa)
            db.session.flush() 

            admin_user = Usuario(
                pessoa_id=admin_pessoa.id,
                username="admin",
                role="FUNCIONARIO"
            )
            admin_user.set_senha("admin123") 

            db.session.add(admin_user)
            db.session.commit()
            
            print("="*50)
            print("ADMINISTRADOR PADRÃO CRIADO:")
            print("Username: admin")
            print("Senha:    admin123")
            print("="*50)
        else:
            print("Administrador já existe no sistema.")
            
    except Exception as e:
        db.session.rollback()
        print("Erro ao inicializar banco de dados:", e)

app.register_blueprint(pessoas_bp)
app.register_blueprint(livros_bp)
app.register_blueprint(emprestimos_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(indicacoes_bp)
app.register_blueprint(categorias_bp)

@app.route("/")
def home():
    return "API da Biblioteca está rodando com sucesso!"

if __name__ == "__main__":
    app.run(debug=True)