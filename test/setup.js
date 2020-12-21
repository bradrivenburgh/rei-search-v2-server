const { expect } = require('chai');
const supertest = require('supertest');
const sinon = require('sinon');

global.expect = expect;
global.supertest = supertest;
global.sinon = sinon;