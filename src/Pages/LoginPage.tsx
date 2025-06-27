// LoginPage.tsx
import React, { useState } from "react";
import {useHistory} from "react-router";
import { setUserToken } from "Globals/GlobalStore";
import {courseListPagePath} from "Pages/CourseListPage";
// import {registerPagePath} from "Pages/RegisterPage";
import {LoginMessage} from "Plugins/UserService/APIs/LoginMessage";

export const loginPagePath="/login"
export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const history = useHistory();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        
        history.push(courseListPagePath); 
        try {
            console.log("sent!")
            new LoginMessage(username, password).send(
                (info:string)=>{
                    const token=JSON.parse(info)
                    setUserToken(token)
                    history.push(courseListPagePath);
                }
            )
        } catch (err: any) {// for testing
            // setMessage(err.message || "登录失败");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ede9fe 0%, #c7d2fe 100%)', fontFamily: "'Poppins','Noto Sans SC',sans-serif" }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 420, padding: 40, borderRadius: 32, boxShadow: '0 8px 32px 0 rgba(76, 29, 149, 0.18)', background: 'rgba(255,255,255,0.95)', border: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Decorative blurred circle */}
                <div style={{ position: 'absolute', top: -64, left: -64, width: 192, height: 192, background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', borderRadius: '50%', filter: 'blur(48px)', opacity: 0.25, zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: -64, right: -64, width: 192, height: 192, background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)', borderRadius: '50%', filter: 'blur(48px)', opacity: 0.18, zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px 0 #a78bfa55', marginBottom: 24, marginTop: 8 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white"><path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12zm0 1.5c-3 0-9 1.5-9 4.5V21h18v-3c0-3-6-4.5-9-4.5z" fill="currentColor"/></svg>
                    </div>
                    <h1 style={{ fontSize: 36, fontWeight: 800, color: '#7c3aed', textShadow: '0 2px 8px #a78bfa33', marginBottom: 8, textAlign: 'center', letterSpacing: 2, fontFamily: "'Poppins','Noto Sans SC',sans-serif" }}>清华大学选课系统</h1>
                    <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, gap: 24 }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type="text"
                                placeholder="用户名"
                                style={{ width: '100%', padding: '14px 48px 14px 20px', border: '2px solid #c4b5fd', borderRadius: 18, background: '#fff', color: '#6d28d9', fontSize: 18, fontWeight: 500, outline: 'none', boxShadow: '0 2px 8px #a78bfa11', transition: 'border 0.2s', fontFamily: "'Poppins','Noto Sans SC',sans-serif" }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.5-1.8 4.5-4.5S14.7 3 12 3 7.5 4.8 7.5 7.5 9.3 12 12 12z" fill="currentColor"/></svg>
                            </span>
                        </div>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type="password"
                                placeholder="密码"
                                style={{ width: '100%', padding: '14px 48px 14px 20px', border: '2px solid #c4b5fd', borderRadius: 18, background: '#fff', color: '#6d28d9', fontSize: 18, fontWeight: 500, outline: 'none', boxShadow: '0 2px 8px #a78bfa11', transition: 'border 0.2s', fontFamily: "'Poppins','Noto Sans SC',sans-serif" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }}>
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17 10.5V7a5 5 0 10-10 0v3.5M5 10.5h14M7 10.5v7a2 2 0 002 2h6a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                        </div>
                        {message && <div style={{ color: '#ef4444', fontSize: 14, textAlign: 'center' }}>{message}</div>}
                        <button
                            type="submit"
                            style={{ width: '100%', background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)', color: '#fff', padding: '14px 0', borderRadius: 18, fontWeight: 700, fontSize: 20, boxShadow: '0 2px 8px #a78bfa33', border: 0, marginTop: 8, letterSpacing: 2, fontFamily: "'Poppins','Noto Sans SC',sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                            登录
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}