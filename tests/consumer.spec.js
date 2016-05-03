import { Consumer, ConsumerObject } from '/dist/consumerjs';


describe('Consumer', function() {
    beforeEach(function() {
        jasmine.Ajax.install();

        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/200')
          .andReturn({ status: 200, responseText: '{"title":"FooBar"}' });
        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/201')
          .andReturn({ status: 200, responseText: '[{"title":"FooBar"}, {"title":"FooBaz"}]' });
        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/202?foo=bar')
          .andReturn({ status: 200, responseText: '[{"title":"FooBar"}, {"title":"FooBaz"}]' });
        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/203?api_key=ABC')
          .andReturn({ status: 200, responseText: '[{"title":"FooBar"}, {"title":"FooBaz"}]' });
        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/204?format=json&api_key=ABC')
          .andReturn({ status: 200, responseText: '[{"title":"FooBar"}, {"title":"FooBaz"}]' });
        jasmine.Ajax
          .stubRequest('http://example.com/api/posts/404')
          .andReturn({ status: 404 });

    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
    });

    it('should instantiate', function() {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        expect(consumer.constructor.name).toBe('Consumer');
        expect(consumer.endpoint).toBe('http://example.com/api');
        expect(consumer.objectClass.name).toBe('Post');
    });

    it('should extend', function() {
        class Post extends ConsumerObject {}
        class PostConsumer extends Consumer {
            constructor() {
                super();
                this.endpoint = 'http://example.com/api';
                this.objectClass = Post;
            }
        }

        let consumer = new PostConsumer();
        expect(consumer.constructor.name).toBe('PostConsumer');
        expect(consumer.endpoint).toBe('http://example.com/api');
        expect(consumer.objectClass.name).toBe('Post');
    });

    it('should resolve with a single ConsumerObject', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.get('/posts/200')
            .then(data => {
                expect(data.constructor.name).toBe('Post');
                expect(data.__consumer__.constructor.name).toBe('Consumer');
                expect(data.title).toBe('FooBar');
                done();
            });
    });

    it('should resolve with a range of ConsumerObjects', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.get('/posts/201')
            .then(data => {
                expect(Array.isArray(data)).toBeTruthy();

                expect(data[0].constructor.name).toBe('Post');
                expect(data[0].__consumer__.constructor.name).toBe('Consumer');
                expect(data[0].title).toBe('FooBar');

                expect(data[1].constructor.name).toBe('Post');
                expect(data[1].__consumer__.constructor.name).toBe('Consumer');
                expect(data[1].title).toBe('FooBaz');
                done();
            });
    });

    it('should reject with a HttpResponseMessage', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.get('/posts/404')
            .catch(data => {
                expect(data.constructor.name).toBe('HttpResponseMessage');
                done();
            });
    });

    it('should support DELETE', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.delete('/posts/200', {foo: 'bar'})
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('DELETE');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support GET', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.get('/posts/202', {foo: 'bar'})
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/202?foo=bar');
                done();
            });
    });

    it('should support PATCH', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.patch('/posts/200', {foo: 'bar'})
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('PATCH');
                expect(request.params).toBe('{"foo":"bar"}');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support POST', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.post('/posts/200', {foo: 'bar'})
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('POST');
                expect(request.params).toBe('{"foo":"bar"}');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support PUT', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.put('/posts/200', {foo: 'bar'})
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('PUT');
                expect(request.params).toBe('{"foo":"bar"}');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support default properties', function(done) {
        class Post extends ConsumerObject {}

        let options = {
                defaultParameters: {
                    'api_key': 'ABC',
                }
            },
            consumer = new Consumer('http://example.com/api', Post, options);

        consumer.get('/posts/203')
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/203?api_key=ABC');
                done();
            });
    });

    it('should support default properties combined with parameters', function(done) {
        class Post extends ConsumerObject {}

        let options = {
                defaultParameters: {
                    'api_key': 'ABC',
                }
            },
            consumer = new Consumer('http://example.com/api', Post, options);

        consumer.get('/posts/204', { format: 'json' })
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/204?format=json&api_key=ABC');
                done();
            });
    });

    it('should support csrf', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);

        spyOn(consumer, 'getCookie').and.returnValue('ABC');

        consumer.post('/posts/200')
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders[consumer.csrfHeader]).toBe('ABC');
                expect(request.method).toBe('POST');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should ignore csrf on safe requests', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);

        spyOn(consumer, 'getCookie').and.returnValue('ABC');

        consumer.get('/posts/200')
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders[consumer.csrfHeader]).toBeUndefined();
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support custom headers', function(done) {
        class Post extends ConsumerObject {}

        let consumer = new Consumer('http://example.com/api', Post);
        consumer.addHeader('X-Requested-With', 'Commodore 64');

        consumer.get('/posts/200')
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders['X-Requested-With']).toBe('Commodore 64');
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/200');
                done();
            });
    });

    it('should support default headers', function(done) {
        class Post extends ConsumerObject {}

        let options = {
                defaultHeaders: {
                    'api_key': 'ABC',
                },
                defaultParameters: {
                    'foo': 'bar',
                }
            },
            consumer = new Consumer('http://example.com/api', Post, options);

        consumer.get('/posts/202')
            .then(() => {
                let request = jasmine.Ajax.requests.mostRecent();
                expect(request.requestHeaders.api_key).toBe('ABC');
                expect(request.method).toBe('GET');
                expect(request.url).toBe('http://example.com/api/posts/202?foo=bar');
                done();
            });
    });
});