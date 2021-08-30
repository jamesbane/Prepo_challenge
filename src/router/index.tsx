import React from 'react';
import {Switch, Route, BrowserRouter} from 'react-router-dom';
import PairPage from "../pages/PairPage";
import {Swap} from "../pages/Swap";

export function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path={'/'} component={PairPage} key={'pairpage'} />
                <Route exact path={'/swap'} component={Swap} key={'swap'} />
            </Switch>
        </BrowserRouter>
    )

}