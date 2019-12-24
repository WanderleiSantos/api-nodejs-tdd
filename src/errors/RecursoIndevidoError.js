module.exports = function RecursoIndevidoError(
  message = 'Pertence a outro usuário'
) {
  this.name = 'RecursoIndevidoError';
  this.message = message;
};
