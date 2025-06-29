import React from 'react'
import { render } from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import LoginPage, {loginPagePath} from "Pages/LoginPage";
// import RegisterPage, {registerPagePath} from "Pages/RegisterPage";
// import BookPage, {bookPagePath} from "Pages/BookPage";
import CourseListPage, {courseListPagePath} from "Pages/CourseListPage";
// import { Course } from 'Plugins/CourseService/Objects/Course';
import {courseSelectionPagePath, CourseSelectionPage} from 'Pages/CourseSelectionPage';
import UserManagementPage, { userManagementPagePath } from 'Pages/Admin/UserManagementPage';

const Layout = () => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact component={LoginPage} />
                {/* <Route path={registerPagePath} exact component={RegisterPage} /> */}
                <Route path={loginPagePath} exact component={LoginPage} />
                <Route path={courseListPagePath} exact component={CourseListPage} />
                <Route path={courseSelectionPagePath} exact component = {CourseSelectionPage} />
                <Route path={userManagementPagePath} exact component={UserManagementPage} />
                {/* <Route path={bookPagePath} exact component={BookPage} /> */}
            </Switch>
        </HashRouter>
    )
}
render(<Layout />, document.getElementById('root'))
