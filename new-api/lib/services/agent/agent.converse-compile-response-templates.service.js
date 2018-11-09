import _ from 'lodash';

module.exports = function ({ responses, templateContext }) {

    const { handlebars } = this.server.app;

    let parsedResponses = _.map(responses, (response) => {

        const match = response.match(/{{/g);
        const numberOfExpressions = match ? match.length : 0;
        const compiledResponse = handlebars.compile(response, { strict: true });
        try {
            return { response: compiledResponse(templateContext), numberOfExpressions };
        }
        catch (error) {
            return null;
        }
    });

    try {

        parsedResponses = _.compact(parsedResponses);
        if (parsedResponses.length > 0) {

            const maxNumberOfExpressions = _.max(_.map(parsedResponses, 'numberOfExpressions'));
            parsedResponses = _.filter(parsedResponses, (parsedResponse) => {

                return parsedResponse.response !== '' && parsedResponse.numberOfExpressions === maxNumberOfExpressions;
            });
        }
        return parsedResponses.length > 0 ? parsedResponses[Math.floor(Math.random() * parsedResponses.length)].response : 'Sorry we’re not sure how to respond.';
    }
    catch (error) {
        return { textResponse: 'We\'re having trouble fulfilling that request' };
    }
};
