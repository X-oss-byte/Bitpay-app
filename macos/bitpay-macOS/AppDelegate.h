#import <Cocoa/Cocoa.h>

@class RCTBridge;

@interface AppDelegate : NSObject <NSApplicationDelegate>

@property (nonatomic, readonly) RCTBridge *bridge;

@property (nonatomic, strong) NSWindow *window;

@end
