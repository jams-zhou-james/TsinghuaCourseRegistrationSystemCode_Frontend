import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import LoginPage, {loginPagePath} from "Pages/LoginPage";
import {CourseSelectionPage, courseSelectionPagePath} from 'Pages/Student/CourseSelectionPage';
import UserManagementPage, { userManagementPagePath } from 'Pages/Admin/UserManagementPage';
import TeacherCourseListPage, { teacherCourseListPagePath } from 'Pages/Teacher/CourseListPage';
import StudentCourseListPage, { studentCourseListPagePath } from 'Pages/Student/CourseListPage';
import SystemSettingsPage, { systemSettingsPagePath } from 'Pages/Admin/SystemSettingsPage';
import CourseTablePage, { courseTablePagePath } from 'Pages/CourseTablePage';
import LogoutPage, { logoutPagePath } from 'Pages/LogoutPage';

const Layout = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact component={LoginPage} />
                {/* <Route path={registerPagePath} exact component={RegisterPage} /> */}
                <Route path={loginPagePath} exact component={LoginPage} />
                <Route path={studentCourseListPagePath} exact component={StudentCourseListPage} />
                <Route path={teacherCourseListPagePath} exact component={TeacherCourseListPage} />
                <Route path={courseSelectionPagePath} exact component = {CourseSelectionPage} />
                <Route path={userManagementPagePath} exact component={UserManagementPage} />
                <Route path={systemSettingsPagePath} exact component={SystemSettingsPage} />
                <Route path={courseTablePagePath} exact component={CourseTablePage} />
                {/* Uncomment the line below when BookPage is implemented */}"
                {/* <Route path={bookPagePath} exact component={BookPage} /> */}
                <Route path={logoutPagePath} exact component={LogoutPage} />
            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))
