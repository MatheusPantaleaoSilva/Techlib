from flask import Blueprint, request, jsonify
from utils.validarCPF import validar_cpf
from models.pessoa import Pessoa
from models.usuario import Usuario
from database import db
from sqlalchemy import or_
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix='/auth')

@auth_bp.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()

    nome = data.get("nome")
    cpf = data.get("cpf")
    idade = data.get("idade")
    email = data.get("email")
    numero = data.get("numero")
    username = data.get("username") or email
    senha = data.get("senha")
    tipo = "CLIENTE"

    if not all([nome, cpf, idade, email, numero, username, senha]):
        return jsonify({"msg": "Todos os campos são obrigatórios"}), 400

    if not validar_cpf(cpf):
        return jsonify({"msg": "CPF inválido"}), 400
    
    try:
        pessoa = Pessoa(
            nome=nome,
            cpf=cpf,
            idade=idade,
            email=email,
            numero=numero,
            tipo=tipo
        )
        db.session.add(pessoa)
        db.session.flush()

        usuario = Usuario(
            pessoa_id=pessoa.id,
            username=username,
            role=tipo 
        )
        usuario.set_senha(senha)
        db.session.add(usuario)
        db.session.commit()

        return jsonify({
            "msg": "Usuário registrado com sucesso!",
            "usuario": {
                "id": usuario.id,
                "username": usuario.username,
                "role": usuario.role
            }
        }), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "CPF, email ou username já cadastrados"}), 409

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    login_input = data.get("username")
    senha = data.get("senha")

    if not (login_input and senha):
        return jsonify({"msg": "Username/Email e senha são obrigatórios"}), 400
    
    usuario = Usuario.query.join(Pessoa).filter(
        or_(
            Usuario.username == login_input,
            Pessoa.email == login_input
        )
    ).first()

    if not usuario or not usuario.checar_senha(senha):
        return jsonify({"msg": "Credenciais inválidas"}), 401

    additional_claims = {"role": usuario.role, "pessoa_id": usuario.pessoa_id}
    access_token = create_access_token(identity=str(usuario.id), additional_claims=additional_claims)

    return jsonify({
        "access_token": access_token, 
        "usuario": {
            "id": usuario.id, 
            "username": usuario.username, 
            "role": usuario.role,
            "nome": usuario.pessoa.nome
        }
    }), 200

@auth_bp.route("/perfil", methods=["GET"])
@jwt_required()
def ver_perfil():
    identity = get_jwt_identity()
    print("DEBUG: identity recebido do token:", identity)

    usuario = Usuario.query.get(int(identity))
    if not usuario:
        print("DEBUG: Usuario não encontrado")
        return jsonify({"msg": "Usuário não encontrado"}), 404

    pessoa = Pessoa.query.get(usuario.pessoa_id)
    if not pessoa:
        print("DEBUG: Pessoa não encontrada")
        return jsonify({"msg": "Pessoa associada não encontrada"}), 404

    print("DEBUG: Pessoa encontrada:", pessoa)
    return jsonify(pessoa.mostrar_dados())

@auth_bp.route("/perfil", methods=["PUT"])
@jwt_required()
def atualizar_perfil():
    identity = get_jwt_identity()
    usuario = Usuario.query.get(int(identity))
    if not usuario:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    pessoa = Pessoa.query.get(usuario.pessoa_id)
    if not pessoa:
        return jsonify({"msg": "Pessoa associada não encontrada"}), 404

    data = request.get_json()
    try:
        pessoa.nome = data.get("nome", pessoa.nome)
        pessoa.email = data.get("email", pessoa.email)
        pessoa.numero = data.get("numero", pessoa.numero)
        pessoa.idade = data.get("idade", pessoa.idade)

        if data.get("senha"):
            usuario.set_senha(data["senha"])

        db.session.commit()
        return jsonify({"msg": "Perfil atualizado com sucesso", "usuario": pessoa.mostrar_dados()})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Erro ao atualizar perfil", "erro": str(e)}), 400
