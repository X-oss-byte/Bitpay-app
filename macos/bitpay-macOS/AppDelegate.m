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
  CGFloat screenWidth = 400;
  CGFloat screenHeight = 650;
  
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

  // Set minimum and maximum size
  [self.window setMinSize:NSMakeSize(400, 650)];
  [self.window setMaxSize:NSMakeSize(800, 800)];

  // Center the window
  [self.window center];
  
  // Assign to windowController property and show the window
  self.windowController = [[NSWindowController alloc] initWithWindow:self.window];
  [self.windowController showWindow:self];

  // Bring the application to the front
  [NSApp activateIgnoringOtherApps:YES];
}

- (void)applicationWillTerminate:(NSNotification *)aNotification {
  // Insert code here to tear down your application
}

#pragma mark - RCTBridgeDelegate Methods

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"]; // .jsbundle;
}

- (IBAction)openHelp:(id)senderId
{
  NSURL *url = [NSURL URLWithString:@"https://support.bitpay.com/hc/en-us"];
  [[NSWorkspace sharedWorkspace] openURL:url];
}

- (IBAction)openReportIssue:(id)senderId
{
  NSURL *url = [NSURL URLWithString:@"https://bitpay.com/request-help/wizard?category=wallet"];
  [[NSWorkspace sharedWorkspace] openURL:url];
}

- (IBAction)openPrivacyPolicy:(id)senderId
{
  NSURL *url = [NSURL URLWithString:@"https://bitpay.com/about/privacy"];
  [[NSWorkspace sharedWorkspace] openURL:url];
}

- (IBAction)openTOU:(id)senderId
{
  NSURL *url = [NSURL URLWithString:@"https://bitpay.com/legal/terms-of-use/#wallet-terms-of-use"];
  [[NSWorkspace sharedWorkspace] openURL:url];
}

@end
