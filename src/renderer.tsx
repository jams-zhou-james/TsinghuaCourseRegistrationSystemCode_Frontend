import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import LoginPage, {loginPagePath} from "Pages/LoginPage";
import {courseSelectionPagePath, CourseSelectionPage} from 'Pages/Student/CourseSelectionPage';
import UserManagementPage, { userManagementPagePath } from 'Pages/Admin/UserManagementPage';
import TeacherCourseListPage, { teacherCourseListPagePath } from 'Pages/Teacher/CourseListPage';
import StudentCourseListPage, { studentCourseListPagePath } from 'Pages/Student/CourseListPage';

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
                {/* <Route path={bookPagePath} exact component={BookPage} /> */}
            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))
