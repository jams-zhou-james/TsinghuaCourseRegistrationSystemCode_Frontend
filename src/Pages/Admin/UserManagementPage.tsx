
import React, { useEffect, useState } from 'react';
import { UserInfo } from 'Plugins/UserService/Objects/UserInfo';
import { UserRole, userRoleList } from 'Plugins/UserService/Objects/UserRole';
import { QueryUserInfoMessage } from 'Plugins/UserService/APIs/QueryUserInfoMessage';
import { CreateUserMessage } from 'Plugins/UserService/APIs/CreateUserMessage';
import { UpdateUserInfoMessage } from 'Plugins/UserService/APIs/UpdateUserInfoMessage';
import { DeleteUserMessage } from 'Plugins/UserService/APIs/DeleteUserMessage';
import { Token } from 'Plugins/AuthService/Objects/Token';
import { API } from 'Plugins/CommonUtils/Send/API';
import DefaultLayout from '../../Layouts/DefaultLayout';

// 假设有全局获取管理员Token的方法
declare function getAdminToken(): Token;
const userRole: UserRole = UserRole.superAdmin; // 假设当前用户是超级管理员

export const userManagementPagePath = '/admin/user-management';

// 用户管理主页面
const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<UserInfo | null>(null);
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        role: UserRole.student as UserRole,
    });

    // 获取所有用户（此处假设有批量查询接口，若无则需后端支持）
    // 获取所有用户（无后端时用模拟数据）
    const fetchUsers = async () => {
        setLoading(true);
        // 模拟数据
        const mockUsers: UserInfo[] = [
            new UserInfo('1', 'student01', '', UserRole.student, '张三'),
            new UserInfo('2', 'teacher01', '', UserRole.teacher, '李老师'),
            new UserInfo('3', 'student02', '', UserRole.student, '王五'),
            new UserInfo('4', 'teacher02', '', UserRole.teacher, '赵老师'),
        ];
        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 新增或编辑用户
    const handleSave = () => {
        const adminToken = getAdminToken();
        if (editUser) {
            // 编辑
            const keys = ['username', 'name', 'role'];
            const values = [form.username, form.name, form.role];
            if (form.password) {
                keys.push('password');
                values.push(form.password);
            }
            const msg = new UpdateUserInfoMessage(adminToken, editUser.userID, keys, values);
            msg.send(
                () => {
                    setShowModal(false);
                    fetchUsers();
                }
            );
        } else {
            // 新增
            const msg = new CreateUserMessage(adminToken, form.username, form.password, form.role, form.name);
            msg.send(
                () => {
                    setShowModal(false);
                    fetchUsers();
                }
            );
        }
    };

    // 删除用户
    const handleDelete = (user: UserInfo) => {
        const adminToken = getAdminToken();
        const msg = new DeleteUserMessage(adminToken, user.userID);
        msg.send(() => fetchUsers());
    };

    // 打开编辑弹窗
    const openEdit = (user: UserInfo) => {
        setEditUser(user);
        setForm({
            username: user.username,
            password: '',
            name: user.name,
            role: user.role,
        });
        setShowModal(true);
    };

    // 打开新增弹窗
    const openAdd = () => {
        setEditUser(null);
        setForm({ username: '', password: '', name: '', role: UserRole.student });
        setShowModal(true);
    };

    // 过滤用户
    const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;
    const renderContent = () => {
    return (
        <div style={{ padding: 24 }}>
            <h2>用户管理</h2>
            <div style={{ marginBottom: 16 }}>
                <button onClick={openAdd}>新增用户</button>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | '')} style={{ marginLeft: 16 }}>
                    <option value=''>全部角色</option>
                    {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>
            <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '100%', background: '#fff' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>用户名</th>
                        <th>姓名</th>
                        <th>角色</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user.userID}>
                            <td>{user.userID}</td>
                            <td>{user.username}</td>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => openEdit(user)}>编辑</button>
                                <button onClick={() => handleDelete(user)} style={{ marginLeft: 8, color: 'red' }}>删除</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {loading && <div>加载中...</div>}

            {/* 新增/编辑弹窗 */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: 24, minWidth: 320 }}>
                        <h3>{editUser ? '编辑用户' : '新增用户'}</h3>
                        <div style={{ marginBottom: 8 }}>
                            <label>用户名：</label>
                            <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={!!editUser} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label>密码：</label>
                            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editUser ? '不修改请留空' : ''} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label>姓名：</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label>角色：</label>
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                                {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <button onClick={handleSave}>{editUser ? '保存' : '创建'}</button>
                            <button onClick={() => setShowModal(false)} style={{ marginLeft: 16 }}>取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    };
    return (
    <DefaultLayout role={userRole}>
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-100 to-purple-200 py-12 px-2">
        {renderContent()}
      </div>
    </DefaultLayout>
  );
};

export default UserManagementPage;


// import React, { useEffect, useState } from 'react';
// import { UserInfo } from 'Plugins/UserService/Objects/UserInfo';
// import { UserRole, userRoleList } from 'Plugins/UserService/Objects/UserRole';
// import { QueryUserInfoMessage } from 'Plugins/UserService/APIs/QueryUserInfoMessage';
// import { CreateUserMessage } from 'Plugins/UserService/APIs/CreateUserMessage';
// import { UpdateUserInfoMessage } from 'Plugins/UserService/APIs/UpdateUserInfoMessage';
// import { DeleteUserMessage } from 'Plugins/UserService/APIs/DeleteUserMessage';
// import { Token } from 'Plugins/AuthService/Objects/Token';
// import { API } from 'Plugins/CommonUtils/Send/API';

// // 假设有全局获取管理员Token的方法
// declare function getAdminToken(): Token;

// // 用户管理主页面
// const UserManagement: React.FC = () => {
//     const [users, setUsers] = useState<UserInfo[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
//     const [showModal, setShowModal] = useState(false);
//     const [editUser, setEditUser] = useState<UserInfo | null>(null);
//     const [form, setForm] = useState({
//         username: '',
//         password: '',
//         name: '',
//         role: UserRole.student as UserRole,
//     });

//     // 获取所有用户（此处假设有批量查询接口，若无则需后端支持）
//     const fetchUsers = async () => {
//         setLoading(true);
//         // 这里只做演示，实际应有批量查询接口
//         // 假设有用户ID列表
//         const userIdList: string[] = [];
//         const adminToken = getAdminToken();
//         const result: UserInfo[] = [];
//         for (const userID of userIdList) {
//             await new Promise<void>((resolve) => {
//                 const msg = new QueryUserInfoMessage(adminToken, userID);
//                 msg.send(
//                     (res: any) => {
//                         if (res && res.userInfo) result.push(res.userInfo);
//                         resolve();
//                     },
//                     () => resolve()
//                 );
//             });
//         }
//         setUsers(result);
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchUsers();
//     }, []);

//     // 新增或编辑用户
//     const handleSave = () => {
//         const adminToken = getAdminToken();
//         if (editUser) {
//             // 编辑
//             const keys = ['username', 'name', 'role'];
//             const values = [form.username, form.name, form.role];
//             if (form.password) {
//                 keys.push('password');
//                 values.push(form.password);
//             }
//             const msg = new UpdateUserInfoMessage(adminToken, editUser.userID, keys, values);
//             msg.send(
//                 () => {
//                     setShowModal(false);
//                     fetchUsers();
//                 }
//             );
//         } else {
//             // 新增
//             const msg = new CreateUserMessage(adminToken, form.username, form.password, form.role, form.name);
//             msg.send(
//                 () => {
//                     setShowModal(false);
//                     fetchUsers();
//                 }
//             );
//         }
//     };

//     // 删除用户
//     const handleDelete = (user: UserInfo) => {
//         const adminToken = getAdminToken();
//         const msg = new DeleteUserMessage(adminToken, user.userID);
//         msg.send(() => fetchUsers());
//     };

//     // 打开编辑弹窗
//     const openEdit = (user: UserInfo) => {
//         setEditUser(user);
//         setForm({
//             username: user.username,
//             password: '',
//             name: user.name,
//             role: user.role,
//         });
//         setShowModal(true);
//     };

//     // 打开新增弹窗
//     const openAdd = () => {
//         setEditUser(null);
//         setForm({ username: '', password: '', name: '', role: UserRole.student });
//         setShowModal(true);
//     };

//     // 过滤用户
//     const filteredUsers = roleFilter ? users.filter(u => u.role === roleFilter) : users;

//     return (
//         <div style={{ padding: 24 }}>
//             <h2>用户管理</h2>
//             <div style={{ marginBottom: 16 }}>
//                 <button onClick={openAdd}>新增用户</button>
//                 <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as UserRole | '')} style={{ marginLeft: 16 }}>
//                     <option value=''>全部角色</option>
//                     {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
//                         <option key={role} value={role}>{role}</option>
//                     ))}
//                 </select>
//             </div>
//             <table border={1} cellPadding={8} cellSpacing={0} style={{ width: '100%', background: '#fff' }}>
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>用户名</th>
//                         <th>姓名</th>
//                         <th>角色</th>
//                         <th>操作</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredUsers.map(user => (
//                         <tr key={user.userID}>
//                             <td>{user.userID}</td>
//                             <td>{user.username}</td>
//                             <td>{user.name}</td>
//                             <td>{user.role}</td>
//                             <td>
//                                 <button onClick={() => openEdit(user)}>编辑</button>
//                                 <button onClick={() => handleDelete(user)} style={{ marginLeft: 8, color: 'red' }}>删除</button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             {loading && <div>加载中...</div>}

//             {/* 新增/编辑弹窗 */}
//             {showModal && (
//                 <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                     <div style={{ background: '#fff', padding: 24, minWidth: 320 }}>
//                         <h3>{editUser ? '编辑用户' : '新增用户'}</h3>
//                         <div style={{ marginBottom: 8 }}>
//                             <label>用户名：</label>
//                             <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} disabled={!!editUser} />
//                         </div>
//                         <div style={{ marginBottom: 8 }}>
//                             <label>密码：</label>
//                             <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editUser ? '不修改请留空' : ''} />
//                         </div>
//                         <div style={{ marginBottom: 8 }}>
//                             <label>姓名：</label>
//                             <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
//                         </div>
//                         <div style={{ marginBottom: 8 }}>
//                             <label>角色：</label>
//                             <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
//                                 {userRoleList.filter(r => r !== UserRole.superAdmin).map(role => (
//                                     <option key={role} value={role}>{role}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div style={{ marginTop: 16 }}>
//                             <button onClick={handleSave}>{editUser ? '保存' : '创建'}</button>
//                             <button onClick={() => setShowModal(false)} style={{ marginLeft: 16 }}>取消</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default UserManagement;
