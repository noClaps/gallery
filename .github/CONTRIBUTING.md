# Contributing guidelines

Thanks for contributing to the repository! This guide will give you an overview of different ways you can contribute, including the different types of issues, and how to properly open PRs.

## Issues

### Opening an issue
You can open an issue by heading to the Issues tab and clicking on New issue. This should then provide you with some options for different types of issues, select one and fill out the details. Be as clear and concise as possible, so that it is easy for me to understand and fix the issue. Also, make sure that the issue you are opening has not been opened already by someone else, since duplicate issues don't help solve the problem and only take up more unnecessary space. If you do find an open or closed issue with the problem you are having, you can add your own comment to it, and I will try our best to address it ASAP.

#### Bug
This type of issue is related to any bugs you find in the website, such as a rendering issue or a certain element or font not displaying properly. If you've found a bug in the website, let me know what and where it is. A screenshot would be helpful too. Before you do submit the issue, make sure that you're using the latest versions of both your OS and browser, and test that the bug shows up even after updating. This would seriously help clearing up unnecessary issues that shouldn't have been opened in the first place, and would save time.

#### Idea
This type of issue is meant for you to provide ideas for features to add to the website. However, I have a few rules:

1. No JavaScript. I will close any issues that suggest using JS to add a feature.
2. Nothing should hurt the performance of the website. If you have suggestions to improve performance, I'm more than happy to listen. However, if your suggestion reduces performance, I will not implement it and/or revert any commits I have made related to that feature.
3. No image suggestions. I will add whatever images I want, when I want to add them.
4. No external resources. One of the main goals of this project is to have the entire thing be unreliant on any outside code/resources. This means no CDNs, no external stylesheets, no services outside of GitHub and GitHub Pages, etc.

## Pull Requests (PRs)
Only modifications to `index.html` are allowed. The rules are as follows:

1. No adding any Javascript.
2. Nothing should hurt the performance of the website. You can use Lighthouse or some other performance testing tool to check the performance of the website and compare it to the original.
3. No adding your own images or modifying pre-existing images.
4. No adding external resources such as CDNs, links to stylesheets, no services outside GitHub and GitHub Pages, etc.
5. It is your responsibility to keep up to date with the main repository on your branch.