from flask import Blueprint, request, jsonify
from database import db
from models.pessoa import Pessoa
from models.emprestimo import Emprestimo
from decorators import role_required
from flask_jwt_extended import jwt_required

pessoas_bp = Blueprint("pessoas", __name__)


# Listar todas as pessoas
@pessoas_bp.route("/pessoas", methods=["GET"])
@jwt_required()
@role_required("FUNCIONARIO")
def listar_pessoas():
    pessoas = Pessoa.query.all()
    return jsonify([p.mostrar_dados() for p in pessoas]), 200

# Buscar pessoa por ID
@pessoas_bp.route("/pessoas/<int:id>", methods=["GET"])
@jwt_required()
@role_required("FUNCIONARIO")
def buscar_pessoa(id):
    pessoa = Pessoa.query.get(id)
    if not pessoa:
        return jsonify({"error": "Pessoa não encontrada"}), 404
    return jsonify(pessoa.mostrar_dados()), 200

# Atualizar pessoa
@pessoas_bp.route("/pessoas/<int:id>", methods=["PUT"])
@jwt_required()
@role_required("FUNCIONARIO")
def atualizar_pessoa(id):
    pessoa = Pessoa.query.get(id)
    if not pessoa:
        return jsonify({"error": "Pessoa não encontrada"}), 404

    data = request.json
    
    pessoa.cpf = data.get("cpf", pessoa.cpf)
    pessoa.nome = data.get("nome", pessoa.nome)
    pessoa.idade = data.get("idade", pessoa.idade)
    pessoa.email = data.get("email", pessoa.email)
    pessoa.numero = data.get("numero", pessoa.numero)
    novo_tipo = data.get("tipo", pessoa.tipo)
    pessoa.tipo = novo_tipo

    if pessoa.usuario:
        pessoa.usuario.role = novo_tipo
 
    try:
        db.session.commit()
        return jsonify(pessoa.mostrar_dados()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro ao atualizar dados", "msg": str(e)}), 400

# Deletar pessoa
@pessoas_bp.route("/pessoas/<int:id>", methods=["DELETE"])
@jwt_required()
@role_required("FUNCIONARIO")
def delete_pessoa(id):
    try:
        pessoa = Pessoa.query.get(id)
        if not pessoa:
            return {"msg": "Pessoa não encontrada"}, 404
        Emprestimo.query.filter_by(pessoa_id=id).delete()
        
        if pessoa.usuario:
             db.session.delete(pessoa.usuario)

        db.session.delete(pessoa)
        db.session.commit()

        return {"msg": "Pessoa, usuário e histórico de empréstimos deletados com sucesso"}, 200

    except Exception as e:
        db.session.rollback()  
        print("Erro ao deletar pessoa:", e) # Isso mostra o erro detalhado no terminal do backend
        return {"msg": f"Erro ao deletar pessoa: {str(e)}"}, 500