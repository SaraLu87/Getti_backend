'use strict'

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/usuario');
const { secret, expiresIn } = require('../config/jwt');

const authController = {

  registro: async (req, res) => {
    try {
      const { nombre, correo, contrasena } = req.body;

      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
      }

      const existente = await Usuario.findOne({ correo });
      if (existente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }

      const hash = await bcrypt.hash(contrasena, 10);

      const usuario = new Usuario({
        nombre,
        correo,
        contrasena: hash,
        rol: 'usuario',
        estado: 'aprobado',
        fechaCreacion: new Date()
      });

      const guardado = await usuario.save();
      const { contrasena: _, ...datos } = guardado.toObject();

      res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario: datos });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al registrar usuario', error: err.message });
    }
  },

  registroEmpresario: async (req, res) => {
    try {
      const { nombre, correo, contrasena, tipoNegocio } = req.body;

      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
      }

      const existente = await Usuario.findOne({ correo });
      if (existente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }

      const hash = await bcrypt.hash(contrasena, 10);

      const usuario = new Usuario({
        nombre,
        correo,
        contrasena: hash,
        rol: 'empresario',
        estado: 'pendiente',
        fechaCreacion: new Date()
      });

      await usuario.save();

      res.status(201).json({
        mensaje: 'Solicitud recibida. Tu cuenta está pendiente de aprobación por el equipo de Getti.'
      });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al registrar empresario', error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
      }

      const usuario = await Usuario.findOne({ correo });
      if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }

      const mensajesEstado = {
        pendiente: 'Tu cuenta está pendiente de aprobación por el equipo de Getti',
        rechazado: 'Tu cuenta ha sido rechazada. Contacta al administrador',
        inactivo: 'Tu cuenta está inactiva. Contacta al administrador'
      };

      if (usuario.estado !== 'aprobado') {
        return res.status(403).json({ mensaje: mensajesEstado[usuario.estado] || 'Cuenta no habilitada' });
      }

      const coincide = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!coincide) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }

      const payload = {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      };

      const token = jwt.sign(payload, secret, { expiresIn });

      res.status(200).json({ mensaje: 'Login exitoso', token });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
    }
  }

};

module.exports = authController;
