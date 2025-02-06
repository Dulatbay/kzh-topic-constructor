import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {Provider} from "react-redux";
import {store} from "./redux/store.ts";
import {SelectedNodeProvider} from "./context/SelectedNodeContext.tsx";
import MainPage from "./pages/MainPage.tsx";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import ModulesPage from "./pages/ModulesPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import {Flip, ToastContainer} from "react-toastify";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <SelectedNodeProvider>
                <ToastContainer
                    position="top-center"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    transition={Flip}
                />
                <Router>
                    <Routes>
                        <Route element={<ProtectedRoute adminOnly />}>
                            <Route path="/main" element={<MainPage/>}/>
                        </Route>
                        <Route path="/modules" element={<ModulesPage/>}/>


                        <Route path="/login" element={<LoginPage/>}/>

                        <Route path="*" element={<Navigate to="/modules" replace/>}/>
                    </Routes>
                </Router>
            </SelectedNodeProvider>
        </Provider>
    </StrictMode>,
)
