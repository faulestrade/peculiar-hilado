import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import './Nosotras.css';

function Anim({ children, delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`anim${visible ? ' visible' : ''}`}
      style={delay ? { '--anim-delay': `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

export default function Nosotras() {
  return (
    <main className="nosotras page-enter">

      {/* Hero */}
      <section className="nosotras__hero">
        <div className="container nosotras__hero-inner">
          <Anim>
            <div className="nosotras__hero-text">
              <p className="nosotras__eyebrow">Sobre nosotras</p>
              <h1 className="nosotras__headline">Hilados con identidad,<br />colores para crear</h1>
              <p className="nosotras__intro">
                En Peculiar Hilado creamos hilados teñidos a mano, explorando el color y las posibilidades
                que ofrece la lana Merino. Trabajamos en pequeños lotes, con materias primas cuidadosamente
                elegidas y una búsqueda constante de nuevas combinaciones.
              </p>
            </div>
          </Anim>
          <Anim delay={120}>
            <div className="nosotras__hero-img">
              <img
                src="https://res.cloudinary.com/dkxutp1x/image/upload/w_800,h_800,c_fill,g_south/v1788874854/Screenshot_2026-09-08_at_10.40.37_AM.png"
                alt="Paula en su stand de Peculiar Hilado"
              />
            </div>
          </Anim>
        </div>
      </section>

      {/* Paula */}
      <section className="nosotras__section nosotras__section--alt">
        <Anim>
          <div className="container nosotras__two-col">
            <div className="nosotras__label-col">
              <span className="nosotras__tag">Quién soy</span>
            </div>
            <div className="nosotras__content-col">
              <h2>Hola, soy Paula</h2>
              <p>
                Psicóloga de profesión y una enamorada del mundo de los hilados.
              </p>
              <p>
                En 2020, después de comenzar a tejer y de involucrarme cada vez más en el universo de la
                lana Merino, nació Peculiar Hilado. Lo que empezó como el sueño de teñir mis propios
                colores fue creciendo hasta convertirse en un emprendimiento donde pude unir dos pasiones:
                mi interés por el color y mi amor por el mundo de la lana.
              </p>
              <p>
                Creo que la creatividad es esencial para la vida. Me gusta la posibilidad de jugar,
                probar, improvisar y descubrir qué sucede cuando una idea se transforma en algo concreto.
                Esa curiosidad es la que sigue impulsando mi trabajo con el color.
              </p>
            </div>
          </div>
        </Anim>
      </section>

      {/* Materia prima */}
      <section className="nosotras__section">
        <Anim>
          <div className="container nosotras__two-col">
            <div className="nosotras__label-col">
              <span className="nosotras__tag">Materia prima</span>
            </div>
            <div className="nosotras__content-col">
              <h2>Nuestra materia prima</h2>
              <p>
                Elegimos trabajar con lana Merino superwash de 19 micras, una fibra que combina suavidad,
                calidad y versatilidad. Nuestra lana es cuidadosamente seleccionada e hilada en Uruguay.
              </p>
              <p>
                Nos interesa conocer su recorrido y valorar el trabajo que existe detrás de cada etapa.
                Elegir una buena materia prima es fundamental para ofrecer hilados de calidad y conservar
                las cualidades de la fibra en el producto terminado.
              </p>
            </div>
          </div>
        </Anim>
      </section>

      {/* Color */}
      <section className="nosotras__section nosotras__section--alt">
        <Anim>
          <div className="container nosotras__two-col">
            <div className="nosotras__label-col">
              <span className="nosotras__tag">El proceso</span>
            </div>
            <div className="nosotras__content-col">
              <h2>El color, nuestro proceso</h2>
              <p>
                Cada paleta puede comenzar con una imagen, un paisaje, una combinación de tonos o
                simplemente con las ganas de explorar una nueva posibilidad. Trabajamos con distintas
                técnicas de teñido para desarrollar colores con profundidad, matices y personalidad.
              </p>
              <p>
                Aunque un color pueda repetirse, pueden existir pequeñas variaciones entre partidas y
                madejas de un mismo lote. Estas diferencias son propias del teñido a mano y hacen que
                cada madeja conserve características particulares.
              </p>
            </div>
          </div>
        </Anim>
      </section>

      {/* Propuesta */}
      <section className="nosotras__section">
        <Anim>
          <div className="container nosotras__two-col">
            <div className="nosotras__label-col">
              <span className="nosotras__tag">La propuesta</span>
            </div>
            <div className="nosotras__content-col">
              <h2>Nuestra propuesta</h2>
              <p>
                En Peculiar Hilado vas a encontrar hilados Merino teñidos a mano, sets de minis, paletas
                especiales y colecciones desarrolladas a partir de diferentes búsquedas de color. También
                creamos patrones y propuestas para explorar las posibilidades de nuestros hilados.
              </p>
              <p>Te invitamos a recorrer la tienda y descubrir nuestros colores.</p>
              <Link to="/catalogo" className="btn btn--primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                Ver catálogo
              </Link>
            </div>
          </div>
        </Anim>
      </section>

    </main>
  );
}
