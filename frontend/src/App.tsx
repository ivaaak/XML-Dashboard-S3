import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { ThemeContext } from './components/ThemeContext';
import styles from './App.module.css';

function App() {
   const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
   const { toggleTheme, themeClass } = useContext(ThemeContext);

   return (
      <div className={`${styles.root} ${themeClass}`}>
         <nav className={styles.nav}>
            <Link to="/">
               <div className={styles.navTitle}>
                  <h1 className={styles.title}>XML Dashboard</h1>
               </div>
            </Link>

            <ul className={styles.navList}>
               {isAuthenticated ? (
                  <>
                     <li className={styles.navItem} style={{ textAlign: 'center' }}>
                        <Link to="/profile" className={styles.navLink}>
                           {user?.name?.split('@')[0]}
                        </Link>
                     </li>
                     <button onClick={() => logout()} className={styles.button}>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                     </button>
                  </>
               ) : (
                  <button onClick={() => loginWithRedirect()} className={styles.button}>
                     Log In
                  </button>
               )}
               <li className={styles.navItem}>
                  <button onClick={toggleTheme} className={styles.button}>
                     <FontAwesomeIcon icon={faMoon} />
                  </button>
               </li>
            </ul>
         </nav>
      </div>
   );
}

export default App;