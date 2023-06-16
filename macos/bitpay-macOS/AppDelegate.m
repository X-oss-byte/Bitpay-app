#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@interface AppDelegate () <RCTBridgeDelegate>

@property (strong, nonatomic) NSWindowController *windowController;

@end

@implementation AppDelegate

- (void)awakeFromNib {
  [super awakeFromNib];

  _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
}

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
   // Set your desired screen size
  CGFloat screenWidth = 600;
  CGFloat screenHeight = 800;
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:self.bridge
                                                   moduleName:@"bitpay"
                                            initialProperties:nil];
  
  NSRect contentRect = NSMakeRect(0, 0, screenWidth, screenHeight);
  
  // This is the only window created
  self.window = [[NSWindow alloc] initWithContentRect:contentRect
                                             styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable
                                               backing:NSBackingStoreBuffered
                                                 defer:NO];
  
  [self.window setContentView:rootView];

  // Center the window
  [self.window center];
  
  // Assign to windowController property and show the window
  self.windowController = [[NSWindowController alloc] initWithWindow:self.window];
  [self.windowController showWindow:self];
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
  // Insert code here to tear down your application
}

#pragma mark - RCTBridgeDelegate Methods

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"]; // .jsbundle;
}

@end
