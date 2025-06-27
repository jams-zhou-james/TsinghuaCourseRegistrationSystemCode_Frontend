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
    const history=useHistory();

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
        <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">登录</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="text"
                    placeholder="用户名"
                    className="w-full px-4 py-2 border rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="密码"
                    className="w-full px-4 py-2 border rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {message && <div className="text-red-500 text-sm">{message}</div>}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                    登录
                </button>
            </form>

            {/* 注册按钮 */}
            {/* <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">还没有账号？</span>
                <button
                    onClick={()=>history.push(registerPagePath)}
                    className="ml-2 text-sm text-blue-600 hover:underline"
                >
                    前往注册
                </button>
            </div> */}
        </div>
    );
}