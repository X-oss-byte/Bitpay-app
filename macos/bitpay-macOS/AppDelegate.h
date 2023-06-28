#import <Cocoa/Cocoa.h>

@class RCTBridge;

@interface AppDelegate : NSObject <NSApplicationDelegate>

@property (nonatomic, readonly) RCTBridge *bridge;

@property (nonatomic, strong) NSWindow *window;

-(IBAction)openHelp:(id)senderId;
-(IBAction)openReportIssue:(id)senderId;
-(IBAction)openPrivacyPolicy:(id)senderId;
-(IBAction)openTOU:(id)senderId;

@end
