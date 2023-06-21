import radioFormatter from './radioFormatter';

describe('radioFormatter', () => {
    describe('formatRadioOptions', () => {
        it('should format radio options correctly', () => {
            const radioOptions = 'this is a test';
            const formattedRadioOptions = radioFormatter.formatRadioOptions(radioOptions);
            expect(formattedRadioOptions).toEqual('ThisIsATest');
        });

        it('should format radio options correctly when there are commas', () => { 
            const radioOptions = 'this is a test, this is another test';
            const formattedRadioOptions = radioFormatter.formatRadioOptions(radioOptions);
            expect(formattedRadioOptions).toEqual('ThisIsATestThisIsAnotherTest');
        } );
    });
});
