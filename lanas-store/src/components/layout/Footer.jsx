import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__col">
          <h3>Peculiar Hilado</h3>
          <p>Hilados teñidos a mano en Uruguay.</p>
        </div>
        <div className="footer__col">
          <h4>Navegación</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/catalogo">Catálogo</Link></li>
            <li><Link to="/nosotras">Nosotras</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Contacto</h4>
          <p>hola@peculiarhilado.com</p>
          <p>Uruguay</p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Peculiar Hilado. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
