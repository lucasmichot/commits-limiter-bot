import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import { ReposCreateStatusParams } from '@octokit/rest'

export = (app: Application) => {
  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context: Context) => {
    // Load the configuration file with some default values.
    const config = await context.config('commits-limiter.yml', {
      limit: -1
    })

    // Default status payload
    let statusParams: any = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      sha: context.payload.pull_request.head.sha,
      context: 'commits-limiter-bot'
    }

    // Get the commits limit and the commits count
    const commitsLimit: Number = parseInt(config.limit)
    const commitsCount: Number = context.payload.pull_request.commits

    let state: String
    let description: String

    // If the pull request exceeds the commits limit
    if (commitsLimit > 0 && commitsCount > commitsLimit) {
      state = 'failure'
      description = `This pull request contains more than ${commitsLimit} commits.`

      if (commitsLimit === 1) {
        description = description.replace('commits', 'commit')
      }
    } else {
      state = 'success'
      description = 'This pull request does not contain too many commits.'
    }

    // Set the status payload
    let reposCreateStatusParams: ReposCreateStatusParams = {
      ...statusParams,
      state,
      description
    }

    // Set the pull request status
    await context.github.repos.createStatus(reposCreateStatusParams)
  })
}
