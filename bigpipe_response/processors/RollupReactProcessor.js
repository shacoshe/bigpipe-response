var BaseProcessor = require('BaseProcessor');
var build = require('RollupBaseBuild');
var jsx = require('rollup-plugin-jsx');

var plugins = [ jsx( {factory: 'React.createElement', 'passUnknownTagsToFactory': true} ) ];

//const commonjs = require('@rollup/plugin-commonjs');
//const resolve = require('@rollup/plugin-node-resolve');
//const babel = require('rollup-plugin-babel');
//        babel({
//            exclude: 'node_modules/**',
//            plugins: ['@babel/plugin-transform-react-jsx']
//        }),

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var createReactClass = require('create-react-class');


var BaseComponent = createReactClass({
	getDefaultProps: function() {
	    return { i18n: {} }
	},
    render: function() {
        global.django.catalog = this.props.i18n;
        return this.props.children;
    }
});

class RollupProcessor extends BaseProcessor {

    processResource(input, output, includeDependencies, excludeDependencies) {
        if(input && output) {
            return build(this.isProductionMode, input, output, includeDependencies, excludeDependencies, plugins);
        } else {
            throw new ReferenceError('input, output parameters are require to process the file', input);
        }
    }

    renderResource(render_file, context, i18n) {
        try {
            var requireString = "var React = require('react');\nvar createReactClass = require('create-react-class');\n";
            var Component = React.createElement(this.getModuleForFile(render_file, requireString), context || {});
            var stringRender = ReactDOMServer.renderToString(React.createElement(BaseComponent, {"i18n": i18n}, Component));
            return stringRender;
        } catch(error) {
            console.error(error);
            throw new ReferenceError('Render of file failed [' + error + ']', render_file);
        }
    }

}

module.exports = RollupProcessor;