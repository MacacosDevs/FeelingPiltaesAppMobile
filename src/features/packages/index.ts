// Superficie pública de la feature "packages" (paquetes, carrito y pagos).
export { PackagesScreen } from './screens/PackagesScreen';
export { CarritoScreen } from './screens/CarritoScreen';
export { CarritoProvider, useCarrito } from './context/CarritoContext';
export { paqueteActivoDe, useMisCompras, useMisPaquetesActivos } from './hooks/useMisPaquetesActivos';
export { formatPrecio, formatVigencia } from './utils/money';
