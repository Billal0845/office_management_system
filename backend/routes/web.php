<?php

use Illuminate\Support\Facades\Route;

// This catches EVERY route that isn't an API route and sends it to React
Route::get('{any}', function () {
    return view('app');
})->where('any', '.*');
