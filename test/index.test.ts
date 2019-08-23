import nock from 'nock'
import CommitsLimiterBot from '../src'
import { Probot } from 'probot'
var yaml = require('json2yaml')

nock.disableNetConnect()

describe('Commits Limiter Bot', () => {
  let probot: Probot

  beforeEach(() => {
    probot = new Probot({})
    var app = probot.load(CommitsLimiterBot)
    app.app = () => 'test'

    nock('https://api.github.com')
      .post('/app/installations/1342885/access_tokens')
      .reply(200, { token: 'test' })
  })

  test('status is OK when a pull request is opened and no config exists', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(404)

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/b526f213fc877485386765863ce4b2f6d6962080', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.opened.json')
    await probot.receive({ name: 'pull_request.opened', payload })
  })

  test('status is OK when a pull request is synchronized and no config exists', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(404)

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/7fbfe5d991628cec3215cd05f790df7017209ecb', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.synchronize.json')
    await probot.receive({ name: 'pull_request.synchronize', payload })
  })

  test('status is OK when a pull request is opened and config allows unlimited commits', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: -1 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/b526f213fc877485386765863ce4b2f6d6962080', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: -1 })).toString('base64')
      })

    const payload = require('./fixtures/pull_requests.opened.json')
    await probot.receive({ name: 'pull_request.opened', payload })
  })

  test('status is OK when a pull request is synchronized and config allows unlimited commits', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: -1 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/7fbfe5d991628cec3215cd05f790df7017209ecb', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.synchronize.json')
    await probot.receive({ name: 'pull_request.synchronize', payload })
  })

  test('status is OK when a pull request is opened and has less commit than the limit', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: 99 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/b526f213fc877485386765863ce4b2f6d6962080', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.opened.json')
    await probot.receive({ name: 'pull_request.opened', payload })
  })

  test('status is OK when a pull request is synchronized and has less commit than the limit', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: 99 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/7fbfe5d991628cec3215cd05f790df7017209ecb', (body: any) => {
        expect(body).toMatchObject({
          state: 'success',
          context: 'commits-limiter-bot',
          description: 'This pull request does not contain too many commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.synchronize.json')
    await probot.receive({ name: 'pull_request.synchronize', payload })
  })

  test('status is KO when a pull request is opened and config allows one commit', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from('limit: 1').toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/b526f213fc877485386765863ce4b2f6d6962080', (body: any) => {
        expect(body).toMatchObject({
          state: 'failure',
          context: 'commits-limiter-bot',
          description: 'This pull request contains more than 1 commit.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.opened.json')
    await probot.receive({ name: 'pull_request.opened', payload })
  })

  test('status is KO when a pull request is synchronized and config allows one commit', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from('limit: 1').toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/7fbfe5d991628cec3215cd05f790df7017209ecb', (body: any) => {
        expect(body).toMatchObject({
          state: 'failure',
          context: 'commits-limiter-bot',
          description: 'This pull request contains more than 1 commit.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.synchronize.json')
    await probot.receive({ name: 'pull_request.synchronize', payload })
  })

  test('status is KO when a pull request is opened and config does not allow more commits', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: 2 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/b526f213fc877485386765863ce4b2f6d6962080', (body: any) => {
        expect(body).toMatchObject({
          state: 'failure',
          context: 'commits-limiter-bot',
          description: 'This pull request contains more than 2 commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.opened.json')
    await probot.receive({ name: 'pull_request.opened', payload })
  })

  test('status is KO when a pull request is synchronized and config allows one commit', async () => {
    nock('https://api.github.com')
      .get('/repos/the-repository-owner-login/the-repository-name/contents/.github/commits-limiter.yml')
      .reply(200, {
        content: Buffer.from(yaml.stringify({ limit: 2 })).toString('base64')
      })

    nock('https://api.github.com')
      .post('/repos/the-repository-owner-login/the-repository-name/statuses/7fbfe5d991628cec3215cd05f790df7017209ecb', (body: any) => {
        expect(body).toMatchObject({
          state: 'failure',
          context: 'commits-limiter-bot',
          description: 'This pull request contains more than 2 commits.'
        })

        return true
      })
      .reply(200)

    const payload = require('./fixtures/pull_requests.synchronize.json')
    await probot.receive({ name: 'pull_request.synchronize', payload })
  })
})
